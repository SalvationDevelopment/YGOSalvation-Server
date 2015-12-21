--U.A. Linebacker
function c34614288.initial_effect(c)
	--special summon
	local e1=Effect.CreateEffect(c)
	e1:SetType(EFFECT_TYPE_FIELD)
	e1:SetCode(EFFECT_SPSUMMON_PROC)
	e1:SetProperty(EFFECT_FLAG_UNCOPYABLE)
	e1:SetRange(LOCATION_HAND)
	e1:SetCountLimit(1,34614288)
	e1:SetCondition(c34614288.spcon)
	e1:SetOperation(c34614288.spop)
	c:RegisterEffect(e1)
	--Negate
	local e2=Effect.CreateEffect(c)
	e2:SetType(EFFECT_TYPE_TRIGGER_O+EFFECT_TYPE_FIELD)
	e2:SetCode(EVENT_SPSUMMON_SUCCESS)
	e2:SetRange(LOCATION_MZONE)
	e2:SetCountLimit(1)
	e2:SetTarget(c34614288.distg)
	e2:SetOperation(c34614288.disop)
	c:RegisterEffect(e2)
end
function c34614288.spfilter(c)
	return c:IsFaceup() and c:IsSetCard(0xb2) and not c:IsCode(34614288) and c:IsAbleToHandAsCost()
end
function c34614288.spcon(e,c)
	if c==nil then return true end
	return Duel.GetLocationCount(c:GetControler(),LOCATION_MZONE)>-1
		and Duel.IsExistingMatchingCard(c34614288.spfilter,c:GetControler(),LOCATION_MZONE,0,1,nil)
end
function c34614288.spop(e,tp,eg,ep,ev,re,r,rp,c)
	Duel.Hint(HINT_SELECTMSG,tp,HINTMSG_RTOHAND)
	local g=Duel.SelectMatchingCard(tp,c34614288.spfilter,tp,LOCATION_MZONE,0,1,1,nil)
	Duel.SendtoHand(g,nil,REASON_COST)
end


function c34614288.filter2(c,tp)
	return c:GetSummonPlayer()~=tp
end
function c34614288.distg(e,tp,eg,ep,ev,re,r,rp,chk)
	if chk==0 then return eg:IsExists(c34614288.filter2,1,nil,tp) end
	local g=eg:Filter(c34614288.filter2,nil,tp)
	Duel.SetTargetCard(eg)
	Duel.SetOperationInfo(0,CATEGORY_DESTROY,g,g:GetCount(),0,0)
	Duel.SetOperationInfo(0,CATEGORY_REMOVE,g,g:GetCount(),0,0)
end
function c34614288.filter3(c,e,tp)
	return c:GetSummonPlayer()~=tp	and c:IsRelateToEffect(e) and c:IsLocation(LOCATION_MZONE)
end
function c34614288.disop(e,tp,eg,ep,ev,re,r,rp)
	local c=e:GetHandler()
	local sg=eg:Filter(c34614288.filter3,nil,e,tp)
	if sg:GetCount()>0 and Duel.ChangePosition(sg,POS_FACEUP_DEFENCE,0,POS_FACEUP_ATTACK,0)~=0 then
	local tc=sg:GetFirst()
	while tc do
		local e1=Effect.CreateEffect(c)
		e1:SetType(EFFECT_TYPE_SINGLE)
		e1:SetCode(EFFECT_DISABLE)
		e1:SetReset(RESET_EVENT+0x1fe0000)
		tc:RegisterEffect(e1)
		local e2=Effect.CreateEffect(c)
		e2:SetType(EFFECT_TYPE_SINGLE)
		e2:SetCode(EFFECT_DISABLE_EFFECT)
		e2:SetReset(RESET_EVENT+0x1fe0000)
		tc:RegisterEffect(e2)
		if tc:IsType(TYPE_TRAPMONSTER) then
			local e3=Effect.CreateEffect(c)
			e3:SetType(EFFECT_TYPE_SINGLE)
			e3:SetCode(EFFECT_DISABLE_TRAPMONSTER)
			e3:SetReset(RESET_EVENT+0x1fe0000)
			tc:RegisterEffect(e3)
		end
		tc=sg:GetNext()
	end
	end
end

