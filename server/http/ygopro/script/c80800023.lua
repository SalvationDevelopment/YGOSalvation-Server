--ゴーストリックの猫娘
function c80800023.initial_effect(c)
	--summon limit
	local e1=Effect.CreateEffect(c)
	e1:SetType(EFFECT_TYPE_SINGLE)
	e1:SetCode(EFFECT_CANNOT_SUMMON)
	e1:SetCondition(c80800023.sumcon)
	c:RegisterEffect(e1)
	--turn set
	local e2=Effect.CreateEffect(c)
	e2:SetDescription(aux.Stringid(80800023,0))
	e2:SetCategory(CATEGORY_POSITION)
	e2:SetType(EFFECT_TYPE_IGNITION)
	e2:SetRange(LOCATION_MZONE)
	e2:SetTarget(c80800023.postg)
	e2:SetOperation(c80800023.posop)
	c:RegisterEffect(e2)
	--change pos
	local e3=Effect.CreateEffect(c)
	e3:SetDescription(aux.Stringid(80800023,0))
	e3:SetCategory(CATEGORY_POSITION)
	e3:SetType(EFFECT_TYPE_FIELD+EFFECT_TYPE_TRIGGER_F)
	e3:SetCode(EVENT_SPSUMMON_SUCCESS)
	e3:SetRange(LOCATION_MZONE)
	e3:SetCondition(c80800023.condition)
	e3:SetTarget(c80800023.target)
	e3:SetOperation(c80800023.operation)
	c:RegisterEffect(e3)
	local e4=e3:Clone()
	e4:SetCode(EVENT_SUMMON_SUCCESS)
	c:RegisterEffect(e4)
end
function c80800023.sfilter(c)
	return c:IsFaceup() and c:IsSetCard(0x8d)
end
function c80800023.sumcon(e)
	return not Duel.IsExistingMatchingCard(c80800023.sfilter,e:GetHandlerPlayer(),LOCATION_MZONE,0,1,nil)
end
function c80800023.postg(e,tp,eg,ep,ev,re,r,rp,chk)
	local c=e:GetHandler()
	if chk==0 then return c:IsCanTurnSet() and c:GetFlagEffect(80800023)==0 end
	c:RegisterFlagEffect(80800023,RESET_EVENT+0x1fc0000+RESET_PHASE+PHASE_END,0,1)
	Duel.SetOperationInfo(0,CATEGORY_POSITION,c,1,0,0)
end
function c80800023.posop(e,tp,eg,ep,ev,re,r,rp)
	local c=e:GetHandler()
	if c:IsRelateToEffect(e) and c:IsFaceup() then
		Duel.ChangePosition(c,POS_FACEDOWN_DEFENCE)
	end
end
function c80800023.condition(e)
	return Duel.IsExistingMatchingCard(c80800023.sfilter,e:GetHandlerPlayer(),LOCATION_MZONE,0,1,e:GetHandler())
end
function c80800023.filter(c,e,tp)
	return c:IsFaceup() and c:IsLevelAbove(4) and (not e or c:IsRelateToEffect(e))
end
function c80800023.target(e,tp,eg,ep,ev,re,r,rp,chk)
	if chk==0 then return eg:IsExists(c80800023.filter,1,nil,nil,tp) end
	Duel.SetTargetCard(eg)
	Duel.SetOperationInfo(0,CATEGORY_POSITION,eg,eg:GetCount(),0,0)
end
function c80800023.operation(e,tp,eg,ep,ev,re,r,rp)
	local g=eg:Filter(c80800023.filter,nil,e,tp)
	Duel.ChangePosition(g,POS_FACEDOWN_DEFENCE)
end