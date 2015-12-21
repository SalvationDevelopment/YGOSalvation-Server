--ヘルウェイ·パトロール
function c1078.initial_effect(c)
	--damage
	local e1=Effect.CreateEffect(c)
	e1:SetDescription(aux.Stringid(1078,0))
	e1:SetCategory(CATEGORY_DAMAGE)
	e1:SetCode(EVENT_BATTLE_DESTROYING)
	e1:SetType(EFFECT_TYPE_SINGLE+EFFECT_TYPE_TRIGGER_F)
	e1:SetCondition(c1078.damcondition)
	e1:SetTarget(c1078.damtarget)
	e1:SetOperation(c1078.damoperation)
	c:RegisterEffect(e1)
	--special summon
	local e2=Effect.CreateEffect(c)
	e2:SetCategory(CATEGORY_SPECIAL_SUMMON)
	e2:SetDescription(aux.Stringid(1078,1))
	e2:SetType(EFFECT_TYPE_IGNITION)
	e2:SetRange(LOCATION_GRAVE)
	e2:SetCost(c1078.spcost)
	e2:SetTarget(c1078.sptarget)
	e2:SetOperation(c1078.spoperation)
	c:RegisterEffect(e2)
end
function c1078.damcondition(e,tp,eg,ep,ev,re,r,rp)
	local c=e:GetHandler()
	local a=Duel.GetAttacker()
	local d=Duel.GetAttackTarget()
	return not c:IsStatus(STATUS_BATTLE_DESTROYED) 
		and ((c==a and d:GetLocation()==LOCATION_GRAVE) or (c==d and a:GetLocation()==LOCATION_GRAVE))
end
function c1078.damtarget(e,tp,eg,ep,ev,re,r,rp,chk)
	if chk==0 then return true end
	local a=Duel.GetAttacker()
	local d=Duel.GetAttackTarget()
	local m=0
	if a==e:GetHandler() then m=d:GetLevel()*100
	else m=a:GetLevel()*100 end
	Duel.SetTargetPlayer(1-tp)
	Duel.SetTargetParam(m)
	Duel.SetOperationInfo(0,CATEGORY_DAMAGE,nil,0,1-tp,m)
end
function c1078.damoperation(e,tp,eg,ep,ev,re,r,rp)
	local p,d=Duel.GetChainInfo(0,CHAININFO_TARGET_PLAYER,CHAININFO_TARGET_PARAM)
	Duel.Damage(p,d,REASON_EFFECT)
end
function c1078.spcost(e,tp,eg,ep,ev,re,r,rp,chk)
	if chk==0 then return e:GetHandler():IsAbleToRemoveAsCost() end
	Duel.Remove(e:GetHandler(),POS_FACEUP,REASON_COST)
end
function c1078.filter(c,e,tp)
	local atk=c:GetAttack()
	return atk>=0 and atk<=2000 and c:IsCanBeSpecialSummoned(e,0,tp,false,false)
end
function c1078.sptarget(e,tp,eg,ep,ev,re,r,rp,chk)
	if chk==0 then return Duel.GetLocationCount(tp,LOCATION_MZONE)>0
		and Duel.IsExistingMatchingCard(c1078.filter,tp,LOCATION_HAND,0,1,nil,e,tp) end
	Duel.SetOperationInfo(0,CATEGORY_SPECIAL_SUMMON,nil,1,tp,LOCATION_HAND)
end
function c1078.spoperation(e,tp,eg,ep,ev,re,r,rp)
	if Duel.GetLocationCount(tp,LOCATION_MZONE)<=0 then return end
	Duel.Hint(HINT_SELECTMSG,tp,HINTMSG_SPSUMMON)
	local g=Duel.SelectMatchingCard(tp,c1078.filter,tp,LOCATION_HAND,0,1,1,nil,e,tp)
	if g:GetCount()>0 then
		Duel.SpecialSummon(g,0,tp,tp,false,false,POS_FACEUP)
	end
end
