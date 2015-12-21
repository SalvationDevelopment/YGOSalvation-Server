--Climactic Barricade
function c511000054.initial_effect(c)
	--Activate
	local e1=Effect.CreateEffect(c)
	e1:SetType(EFFECT_TYPE_ACTIVATE)
	e1:SetCode(EVENT_SUMMON_SUCCESS)
	e1:SetOperation(c511000054.operation)
	c:RegisterEffect(e1)
end
function c511000054.operation(e,tp,eg,ep,ev,re,r,rp)
	local e1=Effect.CreateEffect(e:GetHandler())
	e1:SetType(EFFECT_TYPE_FIELD)
	e1:SetCode(EFFECT_CANNOT_ATTACK)
	e1:SetProperty(EFFECT_FLAG_CARD_TARGET)
	e1:SetTargetRange(0,LOCATION_MZONE)
	e1:SetTarget(c511000054.atktarget)
	e1:SetReset(RESET_PHASE+PHASE_END)
	e1:SetValue(1)
	Duel.RegisterEffect(e1,tp)
	--Damage LP
	local e2=Effect.CreateEffect(e:GetHandler())
	e2:SetCategory(CATEGORY_DAMAGE)
	e2:SetDescription(aux.Stringid(511000054,0))
	e2:SetType(EFFECT_TYPE_FIELD+EFFECT_TYPE_TRIGGER_F)
	e2:SetProperty(EFFECT_FLAG_PLAYER_TARGET)
	e2:SetCode(EVENT_PHASE+PHASE_END)
	e2:SetCountLimit(1)
	e2:SetTarget(c511000054.damtg)
	e2:SetOperation(c511000054.damop)
	e2:SetReset(RESET_PHASE+PHASE_END)
	Duel.RegisterEffect(e2,tp)
end
function c511000054.atktarget(e,c)
	return c:GetLevel()<=4
end
function c511000054.filter(c)
	return c:IsFaceup() and c:GetLevel()<=4
end
function c511000054.damtg(e,tp,eg,ep,ev,re,r,rp,chk)
	if chk==0 then return Duel.IsExistingMatchingCard(c511000054.filter,tp,0,LOCATION_MZONE,1,nil) end
	local dam=Duel.GetMatchingGroupCount(c511000054.filter,tp,0,LOCATION_MZONE,nil)*500
	Duel.SetTargetPlayer(1-tp)
	Duel.SetTargetParam(dam)
	if dam>0 then Duel.SetOperationInfo(0,CATEGORY_DAMAGE,nil,0,1-tp,dam) end
end
function c511000054.damop(e,tp,eg,ep,ev,re,r,rp)
	local p=Duel.GetChainInfo(0,CHAININFO_TARGET_PLAYER)
	local dam=Duel.GetMatchingGroupCount(c511000054.filter,tp,0,LOCATION_MZONE,nil)*500
	Duel.Damage(p,dam,REASON_EFFECT)
end
