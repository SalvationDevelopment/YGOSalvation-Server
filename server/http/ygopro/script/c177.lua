--化け猫 MONSTER CAT
function c177.initial_effect(c)
	--destrroy
	local e1=Effect.CreateEffect(c)
	e1:SetDescription(aux.Stringid(177,0))
	e1:SetType(EFFECT_TYPE_TRIGGER_F+EFFECT_TYPE_SINGLE)
	e1:SetCategory(CATEGORY_DESTROY+CATEGORY_DAMAGE)
	e1:SetCode(EVENT_SPSUMMON_SUCCESS)
	e1:SetCondition(c177.descon)
	e1:SetTarget(c177.destg)
	e1:SetOperation(c177.desop)
	c:RegisterEffect(e1)
	--search
	local e3=Effect.CreateEffect(c)
	e3:SetDescription(aux.Stringid(177,0))
	e3:SetCategory(CATEGORY_SEARCH)
	e3:SetType(EFFECT_TYPE_IGNITION)
	e3:SetCountLimit(1)
	e3:SetRange(LOCATION_MZONE)
	e3:SetTarget(c177.target)
	e3:SetOperation(c177.operation)
	c:RegisterEffect(e3)
end

function c177.defilter(c)
	return c:IsLevelBelow(4) and c:IsDestructable() and c:IsFaceup()
end
function c177.destg(e,tp,eg,ep,ev,re,r,rp,chk)
	if chk==0 then return true end
	local g=Duel.GetMatchingGroup(c177.defilter,tp,0,LOCATION_MZONE,nil)
	Duel.SetOperationInfo(0,CATEGORY_DESTROY,g,g:GetCount(),0,0)
end
function c177.desop(e,tp,eg,ep,ev,re,r,rp)
	local g=Duel.GetMatchingGroup(c177.defilter,tp,0,LOCATION_MZONE,nil)
	Duel.Destroy(g,REASON_EFFECT)
	Duel.Damage(1-tp,g:GetCount()*800,REASON_EFFECT)
end
function c177.filter(c)
	local code=c:GetCode()
	return code==170 or code==171
end
function c177.target(e,tp,eg,ep,ev,re,r,rp,chk)
	if chk==0 then return Duel.IsExistingMatchingCard(c177.filter,tp,LOCATION_GRAVE,0,1,nil) end
end
function c177.operation(e,tp,eg,ep,ev,re,r,rp)
	local g=Duel.SelectMatchingCard(tp,c177.filter,tp,LOCATION_GRAVE,0,1,1,nil)
	local tc=g:GetFirst()
	Duel.SendtoHand(g,nil,REASON_EFFECT)	
end
function c177.descon(e,tp,eg,ep,ev,re,r,rp)
	local st=e:GetHandler():GetSummonType()
	return st==(SUMMON_TYPE_SPECIAL+120)
end
	