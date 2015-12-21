--幻水龍
function c80600011.initial_effect(c)
	--spsummon
	local e1=Effect.CreateEffect(c)
	e1:SetType(EFFECT_TYPE_FIELD)
	e1:SetCode(EFFECT_SPSUMMON_PROC)
	e1:SetProperty(EFFECT_FLAG_UNCOPYABLE)
	e1:SetRange(LOCATION_HAND)
	e1:SetCondition(c80600011.spcon)
	e1:SetOperation(c80600011.spop)
	c:RegisterEffect(e1)
end
function c80600011.filter(c)
	return c:IsFaceup() and c:IsAttribute(ATTRIBUTE_EARTH)
end
function c80600011.spcon(e,c)
	if c==nil then return true end
	local tp=c:GetControler()
	return Duel.GetFlagEffect(tp,80600011)==0
		and Duel.GetLocationCount(c:GetControler(),LOCATION_MZONE)>0
		and Duel.IsExistingMatchingCard(c80600011.filter,c:GetControler(),LOCATION_MZONE,0,1,nil)
end
function c80600011.spop(e,tp,eg,ep,ev,re,r,rp,c)
	Duel.RegisterFlagEffect(tp,80600011,RESET_PHASE+PHASE_END,EFFECT_FLAG_OATH,1)
end

