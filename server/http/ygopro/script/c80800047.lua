--Ｎｏ．１０１　Ｓ・Ｈ・Ａｒｋ　Ｋｎｉｇｈｔ
function c80800047.initial_effect(c)
	--xyz summon
	aux.AddXyzProcedure(c,aux.XyzFilterFunction(c,4),2)
	c:EnableReviveLimit()
	--attach
	local e1=Effect.CreateEffect(c)
	e1:SetDescription(aux.Stringid(80800047,0))
	e1:SetCategory(CATEGORY_POSITION)
	e1:SetProperty(EFFECT_FLAG_CARD_TARGET)
	e1:SetType(EFFECT_TYPE_IGNITION)
	e1:SetRange(LOCATION_MZONE)
	e1:SetCost(c80800047.cost)
	e1:SetTarget(c80800047.tg)
	e1:SetOperation(c80800047.op)
	c:RegisterEffect(e1)
	--destroy replace
	local e2=Effect.CreateEffect(c)
	e2:SetType(EFFECT_TYPE_SINGLE+EFFECT_TYPE_CONTINUOUS)
	e2:SetCode(EFFECT_DESTROY_REPLACE)
	e2:SetRange(LOCATION_MZONE)
	e2:SetTarget(c80800047.reptg)
	c:RegisterEffect(e2)
end
function c80800047.cost(e,tp,eg,ep,ev,re,r,rp,chk)
	if chk==0 then return e:GetHandler():CheckRemoveOverlayCard(tp,2,REASON_COST) and
	Duel.GetFlagEffect(tp,80800047)==0 end
	e:GetHandler():RemoveOverlayCard(tp,2,2,REASON_COST)
	Duel.RegisterFlagEffect(tp,80800047,RESET_PHASE+PHASE_END,0,1)
end
function c80800047.filter(c)
	return c:IsPosition(POS_FACEUP_ATTACK) and bit.band(c:GetSummonType(),SUMMON_TYPE_SPECIAL)~=0 and not c:IsType(TYPE_TOKEN)
end
function c80800047.tg(e,tp,eg,ep,ev,re,r,rp,chk,chkc)
	if chkc then return chkc:IsControler(1-tp) and chkc:IsLocation(LOCATION_MZONE) and c80800047.filter(chkc) end
	if chk==0 then return Duel.IsExistingTarget(c80800047.filter,tp,0,LOCATION_MZONE,1,nil) end
	Duel.Hint(HINT_SELECTMSG,tp,HINTMSG_FACEUPATTACK)
	local g=Duel.SelectTarget(tp,c80800047.filter,tp,0,LOCATION_MZONE,1,1,nil)
	Duel.SetOperationInfo(0,CATEGORY_POSITION,g,1,0,0)
end
function c80800047.op(e,tp,eg,ep,ev,re,r,rp)
	local tc=Duel.GetFirstTarget()
	local c=e:GetHandler()
	if c:IsRelateToEffect(e) and tc:IsRelateToEffect(e) then
		local tg=Group.FromCards(tc)
		local mg=tc:GetOverlayGroup()
		if mg:GetCount()>0 then
			Duel.SendtoGrave(mg,REASON_RULE)
		end
		c:SetMaterial(tg)
		Duel.Overlay(c,tg)
	end
end
function c80800047.repfilter(c,tp)
	return c:IsFaceup() and c:IsControler(tp) and c:IsLocation(LOCATION_MZONE) and c:IsSetCard(0x6d) and c:CheckRemoveOverlayCard(tp,1,REASON_EFFECT)
end
function c80800047.reptg(e,tp,eg,ep,ev,re,r,rp,chk)
	if chk==0 then return e:GetHandler():CheckRemoveOverlayCard(tp,1,REASON_EFFECT) end
	if Duel.SelectYesNo(tp,aux.Stringid(80800047,1)) then
		e:GetHandler():RemoveOverlayCard(tp,1,1,REASON_EFFECT)
		return true
	else return false end
end