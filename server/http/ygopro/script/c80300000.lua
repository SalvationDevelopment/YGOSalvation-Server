--Sylvan Bladefender
function c80300000.initial_effect(c)
	--deck check
	local e1=Effect.CreateEffect(c)
	e1:SetDescription(aux.Stringid(80300000,0))
	e1:SetType(EFFECT_TYPE_SINGLE+EFFECT_TYPE_TRIGGER_O)
	e1:SetCode(EVENT_BATTLE_DESTROYING)
	e1:SetCondition(c80300000.condition)
	e1:SetTarget(c80300000.target)
	e1:SetOperation(c80300000.operation)
	c:RegisterEffect(e1)
	--to hand
	local e2=Effect.CreateEffect(c)
	e2:SetDescription(aux.Stringid(80300000,1))
	e2:SetType(EFFECT_TYPE_SINGLE+EFFECT_TYPE_TRIGGER_O)
	e2:SetCode(EVENT_TO_GRAVE)
	e2:SetProperty(EFFECT_FLAG_DAMAGE_STEP+EFFECT_FLAG_DELAY)
	e2:SetCondition(c80300000.tdcon)
	e2:SetTarget(c80300000.tdtg)
	e2:SetOperation(c80300000.tdop)
	c:RegisterEffect(e2)
	if not c80300000.global_check then
		c80300000.global_check=true
		c80300000[0]=Group.CreateGroup()
		c80300000[0]:KeepAlive()
		c80300000[1]=0
		local ge1=Effect.CreateEffect(c)
		ge1:SetType(EFFECT_TYPE_FIELD+EFFECT_TYPE_CONTINUOUS)
		ge1:SetCode(EVENT_CONFIRM_DECKTOP)
		ge1:SetOperation(c80300000.checkop)
		Duel.RegisterEffect(ge1,0)
	end
end
function c80300000.checkop(e,tp,eg,ep,ev,re,r,rp)
	c80300000[0]:Clear()
	c80300000[0]:Merge(eg)
	c80300000[1]=re
end
function c80300000.condition(e,tp,eg,ep,ev,re,r,rp)
	local c=e:GetHandler()
	local a=Duel.GetAttacker()
	local d=Duel.GetAttackTarget()
	if a~=c then d=a end
	return c:IsRelateToBattle() and c:IsFaceup()
		and d and d:GetLocation()==LOCATION_GRAVE and d:IsType(TYPE_MONSTER)
end
function c80300000.target(e,tp,eg,ep,ev,re,r,rp,chk)
	if chk==0 then return Duel.GetFieldGroupCount(tp,LOCATION_DECK,0)>0 end
end
function c80300000.operation(e,tp,eg,ep,ev,re,r,rp)
	if Duel.GetFieldGroupCount(tp,LOCATION_DECK,0)==0 then return end
	Duel.ConfirmDecktop(tp,1)
	local g=Duel.GetDecktopGroup(tp,1)
	local tc=g:GetFirst()
	if tc:IsRace(RACE_PLANT) then
		Duel.DisableShuffleCheck()
		Duel.SendtoGrave(g,REASON_EFFECT)
	else
		Duel.MoveSequence(tc,1)
	end
end
function c80300000.tdcon(e,tp,eg,ep,ev,re,r,rp)
	return re and e:GetHandler():IsPreviousLocation(LOCATION_DECK)
		and c80300000[0]:IsContains(e:GetHandler()) and c80300000[1]==re
end
function c80300000.tdtg(e,tp,eg,ep,ev,re,r,rp,chk)
	if chk==0 then return e:GetHandler():IsAbleToHand() end
	Duel.SetOperationInfo(0,CATEGORY_TOHAND,e:GetHandler(),1,0,0)
end
function c80300000.tdop(e,tp,eg,ep,ev,re,r,rp)
	if e:GetHandler():IsRelateToEffect(e) then
		Duel.SendtoHand(e:GetHandler(),nil,REASON_EFFECT)
		Duel.ConfirmCards(1-tp,e:GetHandler())
	end
end