--Infernity Bishop
function c13790556.initial_effect(c)
	--special summon
	local e1=Effect.CreateEffect(c)
	e1:SetType(EFFECT_TYPE_FIELD)
	e1:SetCode(EFFECT_SPSUMMON_PROC)
	e1:SetProperty(EFFECT_FLAG_UNCOPYABLE)
	e1:SetRange(LOCATION_HAND)
	e1:SetCountLimit(1,13790556)
	e1:SetCondition(c13790556.spcon)
	c:RegisterEffect(e1)
	--destroy replace
	local e2=Effect.CreateEffect(c)
	e2:SetType(EFFECT_TYPE_FIELD+EFFECT_TYPE_CONTINUOUS)
	e2:SetCode(EFFECT_DESTROY_REPLACE)
	e2:SetRange(LOCATION_GRAVE)
	e2:SetTarget(c13790556.reptg)
	e2:SetValue(c13790556.repval)
	c:RegisterEffect(e2)
end
function c13790556.spcon(e,c)
	if c==nil then return true end
	return Duel.GetFieldGroupCount(c:GetControler(),LOCATION_HAND,0)==1
		and Duel.GetLocationCount(c:GetControler(),LOCATION_MZONE)>0
end
function c13790556.repfilter(c,tp)
	return c:IsFaceup() and c:IsControler(tp) and c:IsLocation(LOCATION_MZONE)
		and c:IsSetCard(0xb)
end
function c13790556.reptg(e,tp,eg,ep,ev,re,r,rp,chk)
	if chk==0 then return e:GetHandler():IsAbleToRemove() and eg:IsExists(c13790556.repfilter,1,nil,tp)
	and Duel.GetFieldGroupCount(e:GetHandler():GetControler(),LOCATION_HAND,0)==0 end
	if Duel.SelectYesNo(tp,aux.Stringid(13790556,0)) then
		local g=eg:Filter(c13790556.repfilter,nil,tp)
		if g:GetCount()==1 then
			e:SetLabelObject(g:GetFirst())
		else
			Duel.Hint(HINT_SELECTMSG,tp,HINTMSG_DESREPLACE)
			local cg=g:Select(tp,1,1,nil)
			e:SetLabelObject(cg:GetFirst())
		end
		Duel.Remove(e:GetHandler(),POS_FACEUP,REASON_EFFECT)
		return true
	else return false end
end
function c13790556.repval(e,c)
	return c==e:GetLabelObject()
end
